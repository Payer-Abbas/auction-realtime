// models/bid.js
export default (sequelize, DataTypes) => {
  const Bid = sequelize.define('Bid', {
    id: { 
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    auction_id: { 
      type: DataTypes.INTEGER,
      allowNull: false 
    },
    user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false 
    },
    amount: { 
      type: DataTypes.DECIMAL(12, 2), 
      allowNull: false 
    }
  }, {
    tableName: 'bids',
    underscored: true
  });

  Bid.associate = (models) => {
    Bid.belongsTo(models.User, { foreignKey: 'user_id', as: 'bidder' });  // ✅ correct
    Bid.belongsTo(models.Auction, { foreignKey: 'auction_id', as: 'auction' });
  };

  return Bid;
};
