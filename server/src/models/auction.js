// models/auction.js
export default (sequelize, DataTypes) => {
  const Auction = sequelize.define('Auction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    item_name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    starting_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    bid_increment: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    go_live_at: { type: DataTypes.DATE, allowNull: false },
    end_at: { type: DataTypes.DATE, allowNull: false },
    status: { 
      type: DataTypes.ENUM('scheduled', 'live', 'ended', 'closed'), 
      defaultValue: 'scheduled' 
    },
    winner_bid_id: { type: DataTypes.INTEGER, allowNull: true },

    // 🔑 Fix: ensure seller_id is explicitly defined
    seller_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    }
  }, {
    tableName: 'auctions',
    underscored: true
  });

  Auction.associate = (models) => {
    Auction.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
    Auction.hasMany(models.Bid, { foreignKey: 'auction_id', as: 'bids' });
    Auction.hasOne(models.CounterOffer, { foreignKey: 'auction_id', as: 'counter_offer' });
  };

  return Auction;
};
