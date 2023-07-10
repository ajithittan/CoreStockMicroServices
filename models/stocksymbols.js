const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('stocksymbols', {
    idstocksymbols: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    symbol: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "symbol"
    },
    companyname: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      unique: "name"
    },
    sector: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    industry: {
      type: DataTypes.STRING(500),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'stocksymbols',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idstocksymbols" },
        ]
      },
      {
        name: "symbol",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "symbol" },
        ]
      },
    ]
  });
};
