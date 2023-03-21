const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('usernotifications', {
    idusernotifications: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      iduserprofile: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      symbol: {
        type: DataTypes.STRING(45),
        allowNull: false
      },
      notificationtype: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notifcationmessage: {
        type: DataTypes.STRING(20000),
        allowNull: false
      },
      readstatus: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
    sequelize,
    tableName: 'usernotifications',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idusernotifications" },
        ]
      },
    ]
  });
};
