export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    name: { type: Sequelize.STRING, allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('users');
}
