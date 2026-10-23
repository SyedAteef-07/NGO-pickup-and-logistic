const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding initial vessels...');
    const vessels = [
      {
        vessel_code: 'VSL-HB-001',
        name: 'ThermoSafe Hot Box 40L',
        vessel_type: 'HOT_BOX',
        material: 'STAINLESS_STEEL',
        capacity_value: 40.0,
        capacity_unit: 'LITRES',
        food_grade_certified: true,
        temperature_suitability: 'HOT',
        has_insulation: true,
        has_tight_lid: true,
        status: 'AVAILABLE',
        cleaning_status: 'CLEAN',
        last_cleaned_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        next_cleaning_due: new Date(Date.now() + 3600 * 1000 * 36).toISOString(),
        last_inspected_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
        inspection_result: 'PASSED',
        maintenance_condition: 'GOOD',
        storage_location: 'Main Central Hub - Bay 1',
        notes: 'High-grade thermal insulation for cooked meal transports.',
      },
      {
        vessel_code: 'VSL-IB-002',
        name: 'Insulated Thermal Bag 25L',
        vessel_type: 'INSULATED_BAG',
        material: 'INSULATED_POLYMER',
        capacity_value: 25.0,
        capacity_unit: 'LITRES',
        food_grade_certified: true,
        temperature_suitability: 'MULTI_TEMP',
        has_insulation: true,
        has_tight_lid: true,
        status: 'AVAILABLE',
        cleaning_status: 'CLEAN',
        last_cleaned_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
        next_cleaning_due: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
        last_inspected_at: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
        inspection_result: 'PASSED',
        maintenance_condition: 'GOOD',
        storage_location: 'South Distribution Depot',
        notes: 'Lightweight shoulder-strap insulated bag for rapid volunteer pickups.',
      },
      {
        vessel_code: 'VSL-MC-003',
        name: 'Dairy Milk Can 30L',
        vessel_type: 'MILK_CAN',
        material: 'STAINLESS_STEEL',
        capacity_value: 30.0,
        capacity_unit: 'LITRES',
        food_grade_certified: true,
        temperature_suitability: 'CHILLED',
        has_insulation: false,
        has_tight_lid: true,
        status: 'CLEANING_REQUIRED',
        cleaning_status: 'DIRTY',
        last_cleaned_at: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
        next_cleaning_due: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
        last_inspected_at: new Date(Date.now() - 3600 * 1000 * 90).toISOString(),
        inspection_result: 'ACTION_REQUIRED',
        maintenance_condition: 'GOOD',
        storage_location: 'Sanitization & Wash Bay 2',
        notes: 'Returned from dairy surplus pickup. Awaiting sanitization wash before reuse.',
      },
      {
        vessel_code: 'VSL-CB-004',
        name: 'Arctic Cold Storage Box 50L',
        vessel_type: 'COLD_BOX',
        material: 'INSULATED_POLYMER',
        capacity_value: 50.0,
        capacity_unit: 'LITRES',
        food_grade_certified: true,
        temperature_suitability: 'FROZEN',
        has_insulation: true,
        has_tight_lid: true,
        status: 'AVAILABLE',
        cleaning_status: 'CLEAN',
        last_cleaned_at: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
        next_cleaning_due: new Date(Date.now() + 3600 * 1000 * 48).toISOString(),
        last_inspected_at: new Date(Date.now() - 3600 * 1000 * 50).toISOString(),
        inspection_result: 'PASSED',
        maintenance_condition: 'GOOD',
        storage_location: 'Cold Chain Bay A',
        notes: 'Dedicated for frozen desserts and ice cream excess rescue.',
      },
      {
        vessel_code: 'VSL-CR-005',
        name: 'Ventilated Produce Crate 30kg',
        vessel_type: 'CRATE',
        material: 'FOOD_GRADE_PLASTIC',
        capacity_value: 30.0,
        capacity_unit: 'KG',
        food_grade_certified: true,
        temperature_suitability: 'AMBIENT',
        has_insulation: false,
        has_tight_lid: false,
        status: 'MAINTENANCE',
        cleaning_status: 'CLEAN',
        last_cleaned_at: new Date(Date.now() - 3600 * 1000 * 40).toISOString(),
        next_cleaning_due: new Date(Date.now() + 3600 * 1000 * 72).toISOString(),
        last_inspected_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString(),
        inspection_result: 'ACTION_REQUIRED',
        maintenance_condition: 'NEEDS_REPAIR',
        storage_location: 'Workshop Bay 3',
        notes: 'Side handle cracked during unloading. Needs replacement before redeployment.',
      },
    ];

    for (const v of vessels) {
      const res = await client.query(
        `INSERT INTO app.vessels (
          vessel_code, name, vessel_type, material, capacity_value, capacity_unit,
          food_grade_certified, temperature_suitability, has_insulation, has_tight_lid,
          status, cleaning_status, last_cleaned_at, next_cleaning_due, last_inspected_at,
          inspection_result, maintenance_condition, storage_location, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) ON CONFLICT (vessel_code) DO NOTHING
        RETURNING id, vessel_code, name`,
        [
          v.vessel_code,
          v.name,
          v.vessel_type,
          v.material,
          v.capacity_value,
          v.capacity_unit,
          v.food_grade_certified,
          v.temperature_suitability,
          v.has_insulation,
          v.has_tight_lid,
          v.status,
          v.cleaning_status,
          v.last_cleaned_at,
          v.next_cleaning_due,
          v.last_inspected_at,
          v.inspection_result,
          v.maintenance_condition,
          v.storage_location,
          v.notes,
        ]
      );
      if (res.rows.length > 0) {
        const id = res.rows[0].id;
        // Insert an initial log
        await client.query(
          `INSERT INTO app.vessel_logs (
            vessel_id, log_type, result_status, summary, details
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            id,
            'INSPECTION',
            v.inspection_result || 'PASSED',
            'Initial inventory commissioning inspection',
            'Vessel verified food safe and recorded in AaharaConnect system inventory.',
          ]
        );
        console.log(`Seeded vessel: ${v.vessel_code} (${v.name})`);
      } else {
        console.log(`Vessel already exists: ${v.vessel_code}`);
      }
    }

    console.log('Vessels seeding complete!');
  } catch (err) {
    console.error('Error seeding vessels:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
