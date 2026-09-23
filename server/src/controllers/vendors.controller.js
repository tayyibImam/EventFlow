const pool = require('../config/db');

async function getAllVendors(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM vendors');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
}

async function getVendorById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM vendors WHERE vendor_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
}

async function createVendor(req, res) {
  try {
    const { name, service_type, contact_email, contact_phone, base_price } = req.body;

    if (!name || !service_type) {
      return res.status(400).json({ error: 'name and service_type are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO vendors (name, service_type, contact_email, contact_phone, base_price)
       VALUES (?, ?, ?, ?, ?)`,
      [name, service_type, contact_email || null, contact_phone || null, base_price || 0]
    );

    const [newVendor] = await pool.query('SELECT * FROM vendors WHERE vendor_id = ?', [result.insertId]);
    res.status(201).json(newVendor[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
}

async function updateVendor(req, res) {
  try {
    const { id } = req.params;
    const { name, service_type, contact_email, contact_phone, base_price } = req.body;

    const [existing] = await pool.query('SELECT * FROM vendors WHERE vendor_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    await pool.query(
      `UPDATE vendors SET
        name = ?, service_type = ?, contact_email = ?, contact_phone = ?, base_price = ?
       WHERE vendor_id = ?`,
      [name, service_type, contact_email, contact_phone, base_price, id]
    );

    const [updated] = await pool.query('SELECT * FROM vendors WHERE vendor_id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
}

async function deleteVendor(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT * FROM vendors WHERE vendor_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // event_vendors.vendor_id is ON DELETE CASCADE — this also removes any
    // event_vendors rows booking them, which is the intended behavior.
    await pool.query('DELETE FROM vendors WHERE vendor_id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
}

module.exports = { getAllVendors, getVendorById, createVendor, updateVendor, deleteVendor };
