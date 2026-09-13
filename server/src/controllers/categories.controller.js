const pool = require('../config/db');
// GET /api/categories — list every category
async function getAllCategories(req, res) {
try {
const [rows] = await pool.query('SELECT * FROM categories');
res.json(rows);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to fetch categories' });
}
}
// GET /api/categories/:id — get one category by its id
async function getCategoryById(req, res) {
try {
const { id } = req.params;
const [rows] = await pool.query(
'SELECT * FROM categories WHERE category_id = ?', [id]
);
if (rows.length === 0) {
return res.status(404).json({ error: 'Category not found' });
}
res.json(rows[0]);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to fetch category' });
}
}
// POST /api/categories — create a new category
async function createCategory(req, res) {
try {
const { name, description } = req.body;
if (!name) {
return res.status(400).json({ error: 'name is required' });
}
const [result] = await pool.query(
'INSERT INTO categories (name, description) VALUES (?, ?)',
[name, description || null]
);
const [newCategory] = await pool.query(
'SELECT * FROM categories WHERE category_id = ?', [result.insertId]
);
res.status(201).json(newCategory[0]);
} catch (err) {
if (err.code === 'ER_DUP_ENTRY') {
return res.status(409).json({ error: 'A category with this name already exists' });
}
console.error(err);
res.status(500).json({ error: 'Failed to create category' });
}
}
// PUT /api/categories/:id — update a category
async function updateCategory(req, res) {
try {
const { id } = req.params;
const { name, description } = req.body;
const [existing] = await pool.query(
'SELECT * FROM categories WHERE category_id = ?', [id]
);
if (existing.length === 0) {
return res.status(404).json({ error: 'Category not found' });
}
await pool.query(
'UPDATE categories SET name = ?, description = ? WHERE category_id = ?',
[name, description, id]
);
const [updated] = await pool.query(
'SELECT * FROM categories WHERE category_id = ?', [id]
);
res.json(updated[0]);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to update category' });
}
}
// DELETE /api/categories/:id — delete a category
async function deleteCategory(req, res) {
try {
const { id } = req.params;
const [existing] = await pool.query(
'SELECT * FROM categories WHERE category_id = ?', [id]
);
if (existing.length === 0) {
return res.status(404).json({ error: 'Category not found' });
}
await pool.query('DELETE FROM categories WHERE category_id = ?', [id]);
res.status(204).send();
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to delete category' });
}
}
module.exports = {
getAllCategories,
getCategoryById,
createCategory,
updateCategory,
deleteCategory
};