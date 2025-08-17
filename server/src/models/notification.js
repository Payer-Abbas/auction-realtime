export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    user_id: { 
      type: DataTypes.INTEGER,   // 👈 changed from UUID to INTEGER
      allowNull: false 
    },
    type: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'notifications',
    underscored: true
  });

  return Notification;
};
