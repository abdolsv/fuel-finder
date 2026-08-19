'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /*
     * USERS TABLE
     */
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin'),
        allowNull: false,
        defaultValue: 'admin',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    /*
     * STATIONS TABLE
     */
    await queryInterface.createTable('stations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lat: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      lng: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    /*
     * PRICE REPORTS TABLE
     */
    await queryInterface.createTable('price_reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      stationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fuelType: {
        type: Sequelize.ENUM('petrol', 'diesel', 'kerosene', 'gas'),
        allowNull: false,
        defaultValue: 'petrol',
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      reportedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'anonymous',
      },
      fuelAvailable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    /*
     * INDEXES
     */
    await queryInterface.addIndex('price_reports', ['stationId'], {
      name: 'price_reports_station_id_idx',
    });

    await queryInterface.addIndex('stations', ['lat', 'lng'], {
      name: 'stations_lat_lng_idx',
    });

    await queryInterface.addIndex('stations', ['brand'], {
      name: 'stations_brand_idx',
    });

    await queryInterface.addIndex('stations', ['state'], {
      name: 'stations_state_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('price_reports');
    await queryInterface.dropTable('stations');
    await queryInterface.dropTable('users');
  },
};
