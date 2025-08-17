export default (sequelize, DataTypes) => {
  const CounterOffer = sequelize.define('CounterOffer', {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    auction_id: { type: DataTypes.UUID, allowNull: false },
    seller_id: { type: DataTypes.UUID, allowNull: false },
    highest_bidder_id: { type: DataTypes.UUID, allowNull: false },
    proposed_price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    status: { type: DataTypes.ENUM('pending','accepted','rejected'), defaultValue: 'pending' }
  }, {
    tableName: 'counter_offers',
    underscored: true
  });

  CounterOffer.associate = (models) => {
    CounterOffer.belongsTo(models.Auction, { foreignKey: 'auction_id', as: 'auction' });
  };

  return CounterOffer;
};
