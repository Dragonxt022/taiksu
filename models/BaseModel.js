class BaseModel {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  async findAll(options = {}) {
    const { limit = 100, offset = 0, orderBy = 'id', orderDir = 'ASC' } = options;
    const query = `SELECT * FROM ${this.tableName} ORDER BY ${orderBy} ${orderDir} LIMIT $1 OFFSET $2`;
    const result = await this.db.query(query, [limit, offset]);
    return result.rows;
  }

  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`;
    const result = await this.db.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = BaseModel;