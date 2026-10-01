const pool = require("../config/db");

const {
  searchNearbyStations,
} = require("../services/station/osmStationProvider");

// ======================================================
// GET ALL STATIONS
// GET /api/stations
// ======================================================
//
// Returns stations stored in PostgreSQL.
//
// ======================================================

const getAllStations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.*,
        u.name AS owner_name
      FROM stations s
      LEFT JOIN users u
        ON s.owner_id = u.id
      ORDER BY s.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get all stations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load stations.",
    });
  }
};

// ======================================================
// GET NEARBY REAL EV STATIONS
// GET /api/stations/nearby
// ======================================================
//
// Uses OpenStreetMap + Overpass.
//
// IMPORTANT:
// OSM is discovery data.
// It does not guarantee:
//
// - live availability
// - live pricing
// - booking capability
//
// ======================================================

const getNearbyStations = async (
  req,
  res
) => {
  try {
    const {
      latitude,
      longitude,
      radius,
    } = req.query;

    // ==================================================
    // VALIDATE LOCATION
    // ==================================================

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required.",
      });
    }

    const latitudeNumber =
      Number(latitude);

    const longitudeNumber =
      Number(longitude);

    if (
      !Number.isFinite(
        latitudeNumber
      ) ||
      !Number.isFinite(
        longitudeNumber
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be valid numbers.",
      });
    }

    // ==================================================
    // VALIDATE LATITUDE
    // ==================================================

    if (
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude must be between -90 and 90.",
      });
    }

    // ==================================================
    // VALIDATE LONGITUDE
    // ==================================================

    if (
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Longitude must be between -180 and 180.",
      });
    }

    // ==================================================
    // SEARCH REAL STATIONS
    // ==================================================

    const stations =
      await searchNearbyStations(
        latitudeNumber,
        longitudeNumber,
        radius
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      source: "OpenStreetMap",

      total: stations.length,

      user_location: {
        latitude: latitudeNumber,
        longitude: longitudeNumber,
      },

      search_radius_meters: radius
        ? Number(radius)
        : 200000,

      data: stations,
    });
  } catch (error) {
    console.error(
      "Nearby real stations error:",
      error
    );

    return res.status(
      error.statusCode || 500
    ).json({
      success: false,
      message:
        error.message ||
        "Unable to find nearby charging stations.",
    });
  }
};

// ======================================================
// INTELLIGENT STATION RECOMMENDATION
// GET /api/stations/recommend/:vehicleId
// ======================================================
//
// Example:
//
// GET /api/stations/recommend/1
// ?latitude=26.2061985
// &longitude=78.1904335
//
// Recommendation considers:
//
// 1. Vehicle battery
// 2. Charging threshold
// 3. Connector compatibility
// 4. Distance
// 5. Charging power
// 6. Availability
// 7. Price
// 8. Rating
//
// Database stations:
// - Bookable
// - Application managed
//
// OSM stations:
// - Discovery only
// - Not bookable through our application
// - No fake live availability
// - No fake pricing
//
// ======================================================

const recommendStations = async (
  req,
  res
) => {
  try {
    const {
      vehicleId,
    } = req.params;

    const {
      latitude,
      longitude,
    } = req.query;

    // ==================================================
    // VALIDATE LOCATION
    // ==================================================

    const userLatitude =
      Number(latitude);

    const userLongitude =
      Number(longitude);

    if (
      !Number.isFinite(
        userLatitude
      ) ||
      !Number.isFinite(
        userLongitude
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid latitude and longitude are required.",
      });
    }

    if (
      userLatitude < -90 ||
      userLatitude > 90
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude must be between -90 and 90.",
      });
    }

    if (
      userLongitude < -180 ||
      userLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Longitude must be between -180 and 180.",
      });
    }

    // ==================================================
    // GET VEHICLE
    // ==================================================

    const vehicleResult =
      await pool.query(
        `
        SELECT *
        FROM vehicles
        WHERE id = $1
          AND user_id = $2
        `,
        [
          vehicleId,
          req.user.id,
        ]
      );

    if (
      vehicleResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Vehicle not found or you are not authorized to use it.",
      });
    }

    const vehicle =
      vehicleResult.rows[0];

    // ==================================================
    // VEHICLE INFORMATION
    // ==================================================

    const currentBattery =
      Number(
        vehicle.current_battery ?? 100
      );

    const chargingThreshold =
      Number(
        vehicle.charging_threshold ?? 20
      );

    const batteryCapacity =
      Number(
        vehicle.battery_capacity ?? 0
      );

    const vehicleConnector =
      String(
        vehicle.connector_type || ""
      ).trim().toLowerCase();

    const maxChargingPower =
      Number(
        vehicle.max_charging_power ?? 0
      );

    // ==================================================
    // DETERMINE WHETHER CHARGING IS REQUIRED
    // ==================================================

    const chargingRequired =
      currentBattery <=
      chargingThreshold;

    // ==================================================
    // GET APPLICATION STATIONS
    // ==================================================

    const databaseResult =
      await pool.query(`
        SELECT
          s.*,
          u.name AS owner_name
        FROM stations s
        LEFT JOIN users u
          ON s.owner_id = u.id
        ORDER BY s.created_at DESC
      `);

    // ==================================================
    // ADD DISTANCE TO APPLICATION STATIONS
    // ==================================================

    const databaseStations =
      databaseResult.rows.map(
        (station) => {
          const stationLatitude =
            Number(
              station.latitude
            );

          const stationLongitude =
            Number(
              station.longitude
            );

          const distance =
            calculateDistanceKm(
              userLatitude,
              userLongitude,
              stationLatitude,
              stationLongitude
            );

          return {
            ...station,

            is_external: false,

            source:
              "Application",

            source_type:
              "database",

            bookable: true,

            live_availability: true,

            distance_km:
              distance,
          };
        }
      );

    // ==================================================
    // GET OSM STATIONS
    // ==================================================

    let osmStations = [];

    try {
      osmStations =
        await searchNearbyStations(
          userLatitude,
          userLongitude,
          200000
        );
    } catch (osmError) {
      console.warn(
        "OSM recommendation search failed:",
        osmError.message
      );

      osmStations = [];
    }

    // ==================================================
    // NORMALIZE OSM STATIONS
    // ==================================================

    const externalStations =
      osmStations.map(
        (station) => {
          const stationLatitude =
            Number(
              station.latitude
            );

          const stationLongitude =
            Number(
              station.longitude
            );

          const calculatedDistance =
            calculateDistanceKm(
              userLatitude,
              userLongitude,
              stationLatitude,
              stationLongitude
            );

          return {
            ...station,

            is_external: true,

            source:
              station.source ||
              "OpenStreetMap",

            source_type:
              "osm",

            bookable: false,

            live_availability:
              false,

            price:
              station.price ??
              null,

            rating:
              station.rating ??
              null,

            distance_km:
              station.distance_km ??
              calculatedDistance,
          };
        }
      );

    // ==================================================
    // COMBINE DATABASE + OSM
    // ==================================================

    const allStations = [
      ...databaseStations,
      ...externalStations,
    ];

    // ==================================================
    // SCORE STATIONS
    // ==================================================

    const scoredStations =
      allStations.map(
        (station) => {
          const distance =
            Number(
              station.distance_km
            );

          const power =
            Number(
              station.power ?? 0
            );

          const rating =
            Number(
              station.rating ?? 0
            );

          const price =
            Number(
              station.price ?? 0
            );

          const available =
            station.available !==
            false;

          // ==========================================
          // DISTANCE SCORE
          // ==========================================

          let distanceScore = 0;

          if (
            Number.isFinite(
              distance
            )
          ) {
            if (distance <= 5) {
              distanceScore = 40;
            } else if (
              distance <= 10
            ) {
              distanceScore = 32;
            } else if (
              distance <= 25
            ) {
              distanceScore = 24;
            } else if (
              distance <= 50
            ) {
              distanceScore = 12;
            } else if (
              distance <= 100
            ) {
              distanceScore = 5;
            } else {
              distanceScore = 1;
            }
          }

          // ==========================================
          // POWER SCORE
          // ==========================================

          let powerScore = 0;

          if (power >= 150) {
            powerScore = 25;
          } else if (
            power >= 100
          ) {
            powerScore = 22;
          } else if (
            power >= 50
          ) {
            powerScore = 18;
          } else if (
            power >= 22
          ) {
            powerScore = 12;
          } else if (
            power > 0
          ) {
            powerScore = 6;
          }

          // ==========================================
          // CONNECTOR SCORE
          // ==========================================

          let connectorScore = 0;

          const stationConnectors =
            Array.isArray(
              station.connectors
            )
              ? station.connectors
              : [];

          const stationCharger =
            String(
              station.charger ||
              station.charger_type ||
              ""
            ).toLowerCase();

          if (
            vehicleConnector
          ) {
            const connectorMatches =
              stationConnectors.some(
                (connector) =>
                  String(
                    connector
                  )
                    .toLowerCase()
                    .includes(
                      vehicleConnector
                    ) ||
                  vehicleConnector.includes(
                    String(
                      connector
                    ).toLowerCase()
                  )
              );

            if (
              connectorMatches
            ) {
              connectorScore = 20;
            } else if (
              stationCharger.includes(
                vehicleConnector
              )
            ) {
              connectorScore = 15;
            } else {
              connectorScore = 0;
            }
          } else {
            // Vehicle has no connector information.
            connectorScore = 10;
          }

          // ==========================================
          // AVAILABILITY SCORE
          // ==========================================

          let availabilityScore = 0;

          if (
            station.is_external
          ) {
            // OSM is not guaranteed live.
            availabilityScore = 5;
          } else if (
            available
          ) {
            availabilityScore = 10;
          }

          // ==========================================
          // RATING SCORE
          // ==========================================

          const ratingScore =
            Math.min(
              Math.max(
                rating * 2,
                0
              ),
              10
            );

          // ==========================================
          // PRICE SCORE
          // ==========================================

          let priceScore = 0;

          if (
            station.is_external
          ) {
            // No fake OSM price.
            priceScore = 5;
          } else if (
            price > 0
          ) {
            if (price <= 12) {
              priceScore = 5;
            } else if (
              price <= 18
            ) {
              priceScore = 4;
            } else if (
              price <= 25
            ) {
              priceScore = 2;
            } else {
              priceScore = 1;
            }
          }

          // ==========================================
          // BATTERY SAFETY / DISTANCE FACTOR
          // ==========================================
          //
          // If battery is very low, distance becomes
          // more important.
          //
          // This doesn't invent vehicle range.
          // It simply gives closer stations higher
          // priority when the battery is low.
          //
          // ==========================================

          let batteryUrgencyScore = 0;

          if (
            currentBattery <= 10
          ) {
            if (
              Number.isFinite(
                distance
              ) &&
              distance <= 10
            ) {
              batteryUrgencyScore = 15;
            }
          } else if (
            currentBattery <=
            chargingThreshold
          ) {
            if (
              Number.isFinite(
                distance
              ) &&
              distance <= 10
            ) {
              batteryUrgencyScore = 10;
            }
          } else {
            batteryUrgencyScore = 2;
          }

          // ==========================================
          // BOOKABILITY SCORE
          // ==========================================

          let bookabilityScore = 0;

          if (
            station.bookable
          ) {
            bookabilityScore = 5;
          }

          // ==========================================
          // TOTAL SCORE
          // ==========================================

          const totalScore =
            distanceScore +
            powerScore +
            connectorScore +
            availabilityScore +
            ratingScore +
            priceScore +
            batteryUrgencyScore +
            bookabilityScore;

          return {
            ...station,

            recommendation_score:
              Number(
                totalScore.toFixed(2)
              ),

            score_breakdown: {
              distance:
                distanceScore,

              power:
                powerScore,

              connector:
                connectorScore,

              availability:
                availabilityScore,

              rating:
                ratingScore,

              price:
                priceScore,

              battery_urgency:
                batteryUrgencyScore,

              bookability:
                bookabilityScore,
            },
          };
        }
      );

    // ==================================================
    // SORT BEST FIRST
    // ==================================================

    scoredStations.sort(
      (a, b) => {
        // Highest recommendation score first.
        if (
          b.recommendation_score !==
          a.recommendation_score
        ) {
          return (
            b.recommendation_score -
            a.recommendation_score
          );
        }

        // If scores are equal, prefer closer.
        const distanceA =
          Number.isFinite(
            Number(
              a.distance_km
            )
          )
            ? Number(
                a.distance_km
              )
            : Infinity;

        const distanceB =
          Number.isFinite(
            Number(
              b.distance_km
            )
          )
            ? Number(
                b.distance_km
              )
            : Infinity;

        return (
          distanceA -
          distanceB
        );
      }
    );

    // ==================================================
    // BEST STATION
    // ==================================================

    const bestStation =
      scoredStations.length > 0
        ? scoredStations[0]
        : null;

    // ==================================================
    // GENERATE EXPLANATION
    // ==================================================

    let reason =
      "No suitable charging station was found.";

    if (bestStation) {
      const reasons = [];

      // Connector
      if (
        bestStation
          .score_breakdown
          .connector >= 20
      ) {
        reasons.push(
          "the connector is compatible with your vehicle"
        );
      } else if (
        bestStation
          .score_breakdown
          .connector >= 15
      ) {
        reasons.push(
          "the charging configuration appears compatible"
        );
      }

      // Distance
      if (
        bestStation.distance_km !==
          null &&
        Number.isFinite(
          Number(
            bestStation.distance_km
          )
        )
      ) {
        const distance =
          Number(
            bestStation.distance_km
          );

        if (distance <= 5) {
          reasons.push(
            `it is only ${distance} km away`
          );
        } else if (
          distance <= 10
        ) {
          reasons.push(
            `it is ${distance} km away`
          );
        } else if (
          distance <= 25
        ) {
          reasons.push(
            `it is within ${distance} km`
          );
        }
      }

      // Power
      if (
        Number(
          bestStation.power
        ) >= 150
      ) {
        reasons.push(
          "it provides very high charging power"
        );
      } else if (
        Number(
          bestStation.power
        ) >= 100
      ) {
        reasons.push(
          "it provides high charging power"
        );
      } else if (
        Number(
          bestStation.power
        ) >= 50
      ) {
        reasons.push(
          "it provides fast charging power"
        );
      }

      // Rating
      if (
        Number(
          bestStation.rating
        ) >= 4
      ) {
        reasons.push(
          "it has a good station rating"
        );
      }

      // Availability
      if (
        bestStation.is_external
      ) {
        reasons.push(
          "it is an OpenStreetMap-discovered charging location"
        );
      } else if (
        bestStation.available ===
        true
      ) {
        reasons.push(
          "it is currently marked available"
        );
      }

      // Price
      if (
        !bestStation.is_external &&
        Number(
          bestStation.price
        ) > 0
      ) {
        reasons.push(
          `its charging price is ₹${Number(
            bestStation.price
          ).toFixed(2)}`
        );
      }

      // Battery
      if (
        chargingRequired
      ) {
        reasons.push(
          `your battery is at ${currentBattery}% and has reached your ${chargingThreshold}% charging threshold`
        );
      }

      if (
        reasons.length === 0
      ) {
        reasons.push(
          "it has the highest overall recommendation score from the available station data"
        );
      }

      reason =
        `Recommended because ${reasons.join(
          ", "
        )}.`;
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Charging stations recommended successfully.",

      vehicle: {
        id: vehicle.id,

        brand:
          vehicle.brand,

        model:
          vehicle.model,

        current_battery:
          currentBattery,

        charging_threshold:
          chargingThreshold,

        battery_capacity:
          batteryCapacity,

        connector_type:
          vehicle.connector_type,

        max_charging_power:
          maxChargingPower,

        charging_required:
          chargingRequired,
      },

      user_location: {
        latitude:
          userLatitude,

        longitude:
          userLongitude,
      },

      recommendation: {
        station:
          bestStation,

        reason,

        battery_status: {
          current_battery:
            currentBattery,

          charging_threshold:
            chargingThreshold,

          charging_required:
            chargingRequired,
        },
      },

      total:
        scoredStations.length,

      data:
        scoredStations,
    });
  } catch (error) {
    console.error(
      "Station recommendation error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to recommend charging stations.",
    });
  }
};

// ======================================================
// GET STATIONS BY OWNER
// GET /api/stations/owner/:ownerId
// ======================================================

const getOwnerStations = async (
  req,
  res
) => {
  try {
    const {
      ownerId,
    } = req.params;

    const result =
      await pool.query(
        `
        SELECT
          s.*,
          u.name AS owner_name
        FROM stations s
        LEFT JOIN users u
          ON s.owner_id = u.id
        WHERE s.owner_id = $1
        ORDER BY s.created_at DESC
        `,
        [ownerId]
      );

    return res.status(200).json({
      success: true,

      total:
        result.rows.length,

      data:
        result.rows,
    });
  } catch (error) {
    console.error(
      "Get owner stations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load owner stations.",
    });
  }
};

// ======================================================
// GET CURRENT OWNER'S STATIONS
// GET /api/stations/owner/my
// ======================================================

const getMyStations = async (
  req,
  res
) => {
  try {
    const ownerId =
      req.user.id;

    const result =
      await pool.query(
        `
        SELECT
          s.*,
          u.name AS owner_name
        FROM stations s
        LEFT JOIN users u
          ON s.owner_id = u.id
        WHERE s.owner_id = $1
        ORDER BY s.created_at DESC
        `,
        [ownerId]
      );

    return res.status(200).json({
      success: true,

      total:
        result.rows.length,

      data:
        result.rows,
    });
  } catch (error) {
    console.error(
      "Get my stations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load your stations.",
    });
  }
};

// ======================================================
// GET SINGLE STATION
// GET /api/stations/:id
// ======================================================

const getStationById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const result =
      await pool.query(
        `
        SELECT
          s.*,
          u.name AS owner_name
        FROM stations s
        LEFT JOIN users u
          ON s.owner_id = u.id
        WHERE s.id = $1
        `,
        [id]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Station not found.",
      });
    }

    return res.status(200).json({
      success: true,

      data:
        result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get station error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load station.",
    });
  }
};

// ======================================================
// ADD STATION
// POST /api/stations
// ======================================================

const addStation = async (
  req,
  res
) => {
  try {
    const ownerId =
      req.user.id;

    const {
      name,
      location,
      latitude,
      longitude,
      charger,
      charger_type,
      power,
      price,
      available,
      rating,
      reviews,
      image,
    } = req.body;

    // ==================================================
    // REQUIRED FIELDS
    // ==================================================

    if (
      !name ||
      !location ||
      (!charger && !charger_type) ||
      power === undefined ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, location, charger, power and price are required.",
      });
    }

    // ==================================================
    // NORMALIZE CHARGER
    // ==================================================

    const chargerValue =
      charger ||
      charger_type;

    // ==================================================
    // VALIDATE POWER
    // ==================================================

    const powerNumber =
      Number(power);

    if (
      !Number.isFinite(
        powerNumber
      ) ||
      powerNumber <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Power must be a valid positive number.",
      });
    }

    // ==================================================
    // VALIDATE PRICE
    // ==================================================

    const priceNumber =
      Number(price);

    if (
      !Number.isFinite(
        priceNumber
      ) ||
      priceNumber < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid number.",
      });
    }

    // ==================================================
    // INSERT
    // ==================================================

    const result =
      await pool.query(
        `
        INSERT INTO stations
        (
          owner_id,
          name,
          location,
          charger,
          power,
          price,
          rating,
          reviews,
          available,
          image,
          latitude,
          longitude
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12
        )
        RETURNING *
        `,
        [
          ownerId,
          name,
          location,
          chargerValue,
          powerNumber,
          priceNumber,
          rating ?? 0,
          reviews ?? 0,
          available ?? true,
          image || null,
          latitude ?? null,
          longitude ?? null,
        ]
      );

    return res.status(201).json({
      success: true,

      message:
        "Charging station added successfully.",

      data:
        result.rows[0],
    });
  } catch (error) {
    console.error(
      "Add station error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add charging station.",
    });
  }
};

// ======================================================
// UPDATE STATION
// PUT /api/stations/:id
// ======================================================

const updateStation = async (
  req,
  res
) => {
  try {
    const stationId =
      req.params.id;

    const userId =
      req.user.id;

    const {
      name,
      location,
      latitude,
      longitude,
      charger,
      charger_type,
      power,
      price,
      available,
      rating,
      reviews,
      image,
    } = req.body;

    // ==================================================
    // FIND STATION
    // ==================================================

    const existing =
      await pool.query(
        `
        SELECT *
        FROM stations
        WHERE id = $1
        `,
        [stationId]
      );

    if (
      existing.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Station not found.",
      });
    }

    const station =
      existing.rows[0];

    // ==================================================
    // OWNERSHIP CHECK
    // ==================================================

    if (
      Number(
        station.owner_id
      ) !==
        Number(userId) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this station.",
      });
    }

    // ==================================================
    // NORMALIZE CHARGER
    // ==================================================

    const chargerValue =
      charger ||
      charger_type ||
      station.charger;

    // ==================================================
    // KEEP EXISTING VALUES
    // ==================================================

    const updatedName =
      name !== undefined
        ? name
        : station.name;

    const updatedLocation =
      location !== undefined
        ? location
        : station.location;

    const updatedLatitude =
      latitude !== undefined
        ? latitude
        : station.latitude;

    const updatedLongitude =
      longitude !== undefined
        ? longitude
        : station.longitude;

    const updatedPower =
      power !== undefined
        ? Number(power)
        : station.power;

    const updatedPrice =
      price !== undefined
        ? Number(price)
        : station.price;

    const updatedAvailable =
      available !== undefined
        ? available
        : station.available;

    const updatedRating =
      rating !== undefined
        ? Number(rating)
        : station.rating;

    const updatedReviews =
      reviews !== undefined
        ? Number(reviews)
        : station.reviews;

    const updatedImage =
      image !== undefined
        ? image
        : station.image;

    // ==================================================
    // VALIDATE POWER
    // ==================================================

    if (
      !Number.isFinite(
        updatedPower
      ) ||
      updatedPower <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Power must be a valid positive number.",
      });
    }

    // ==================================================
    // VALIDATE PRICE
    // ==================================================

    if (
      !Number.isFinite(
        updatedPrice
      ) ||
      updatedPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid number.",
      });
    }

    // ==================================================
    // UPDATE
    // ==================================================

    const result =
      await pool.query(
        `
        UPDATE stations
        SET
          name = $1,
          location = $2,
          charger = $3,
          power = $4,
          price = $5,
          rating = $6,
          reviews = $7,
          available = $8,
          image = $9,
          latitude = $10,
          longitude = $11
        WHERE id = $12
        RETURNING *
        `,
        [
          updatedName,
          updatedLocation,
          chargerValue,
          updatedPower,
          updatedPrice,
          updatedRating,
          updatedReviews,
          updatedAvailable,
          updatedImage,
          updatedLatitude,
          updatedLongitude,
          stationId,
        ]
      );

    return res.status(200).json({
      success: true,

      message:
        "Station updated successfully.",

      data:
        result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update station error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update station.",
    });
  }
};

// ======================================================
// DELETE STATION
// DELETE /api/stations/:id
// ======================================================

const deleteStation = async (
  req,
  res
) => {
  try {
    const stationId =
      req.params.id;

    const userId =
      req.user.id;

    // ==================================================
    // FIND STATION
    // ==================================================

    const existing =
      await pool.query(
        `
        SELECT *
        FROM stations
        WHERE id = $1
        `,
        [stationId]
      );

    if (
      existing.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Station not found.",
      });
    }

    const station =
      existing.rows[0];

    // ==================================================
    // OWNERSHIP CHECK
    // ==================================================

    if (
      Number(
        station.owner_id
      ) !==
        Number(userId) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this station.",
      });
    }

    // ==================================================
    // DELETE
    // ==================================================

    await pool.query(
      `
      DELETE FROM stations
      WHERE id = $1
      `,
      [stationId]
    );

    return res.status(200).json({
      success: true,
      message:
        "Station deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete station error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete station.",
    });
  }
};

// ======================================================
// DISTANCE CALCULATOR
// ======================================================
//
// Haversine formula.
//
// Returns distance in kilometers.
//

function calculateDistanceKm(
  lat1,
  lon1,
  lat2,
  lon2
) {
  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }

  const toRadians =
    (value) =>
      (value * Math.PI) / 180;

  const earthRadiusKm =
    6371;

  const dLat =
    toRadians(
      lat2 - lat1
    );

  const dLon =
    toRadians(
      lon2 - lon1
    );

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      toRadians(lat1)
    ) *
      Math.cos(
        toRadians(lat2)
      ) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Number(
    (
      earthRadiusKm * c
    ).toFixed(2)
  );
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getAllStations,
  getNearbyStations,
  recommendStations,
  getOwnerStations,
  getMyStations,
  getStationById,
  addStation,
  updateStation,
  deleteStation,
};