export default (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    auction_id: { type: DataTypes.UUID, allowNull: false },
    buyer_id: { type: DataTypes.UUID, allowNull: false },
    seller_id: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    pdf_url: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'invoices',
    underscored: true
  });

  return Invoice;
};
