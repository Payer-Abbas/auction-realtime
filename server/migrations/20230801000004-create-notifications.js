export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('notifications', {
    id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
    user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    type: { type: Sequelize.STRING, allowNull: false },
    message: { type: Sequelize.STRING, allowNull: false },
    read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('notifications');
}
