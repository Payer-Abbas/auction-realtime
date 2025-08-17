export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('counter_offers', {
    id: { 
      type: Sequelize.INTEGER,   // ✅ use INTEGER auto-increment like other tables
      autoIncrement: true,
      primaryKey: true
    },
    auction_id: { 
      type: Sequelize.INTEGER,   // ✅ matches auctions.id
      allowNull: false,
      references: { model: 'auctions', key: 'id' },
      onDelete: 'CASCADE'
    },
    seller_id: { 
      type: Sequelize.INTEGER,   // ✅ matches users.id
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    highest_bidder_id: { 
      type: Sequelize.INTEGER,   // ✅ matches users.id
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    proposed_price: { type: Sequelize.DECIMAL(12,2), allowNull: false },
    status: { 
      type: Sequelize.ENUM('pending','accepted','rejected'), 
      allowNull: false, 
      defaultValue: 'pending' 
    },
    created_at: { 
      type: Sequelize.DATE, 
      allowNull: false, 
      defaultValue: Sequelize.fn('NOW') 
    },
    updated_at: { 
      type: Sequelize.DATE, 
      allowNull: false, 
      defaultValue: Sequelize.fn('NOW') 
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('counter_offers');
}
