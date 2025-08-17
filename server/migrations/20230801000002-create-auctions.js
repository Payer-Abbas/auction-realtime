export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('auctions', {
    id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
    seller_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    item_name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
    starting_price: { type: Sequelize.DECIMAL(12,2), allowNull: false },
    bid_increment: { type: Sequelize.DECIMAL(12,2), allowNull: false },
    go_live_at: { type: Sequelize.DATE, allowNull: false },
    end_at: { type: Sequelize.DATE, allowNull: false },
    status: { type: Sequelize.ENUM('scheduled','live','ended','closed'), allowNull: false, defaultValue: 'scheduled' },
    winner_bid_id: { type: Sequelize.UUID, allowNull: true },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('auctions');
}
