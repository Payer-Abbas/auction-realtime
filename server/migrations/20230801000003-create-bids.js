export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('bids', {
    id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
    auction_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'auctions', key: 'id' } },
    bidder_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
    amount: { type: Sequelize.DECIMAL(12,2), allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('bids');
}
