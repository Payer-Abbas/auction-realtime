// models/user.js
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { 
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });

  User.associate = (models) => {
    User.hasMany(models.Auction, { foreignKey: 'seller_id', as: 'auctions' });

    // ✅ Fix foreign key: use `user_id` instead of `bidder_id`
    User.hasMany(models.Bid, { foreignKey: 'user_id', as: 'bids' });
  };

  return User;
};
