const User = require('./User');
const Beneficiary = require('./Beneficiary');
const Donation = require('./Donation');
const Event = require('./Event');
const Volunteer = require('./Volunteer');

// Define relationships
User.hasMany(Beneficiary, { foreignKey: 'createdBy', as: 'beneficiaries' });
Beneficiary.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Donation, { foreignKey: 'recordedBy', as: 'donationsRecorded' });
Donation.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

User.hasMany(Event, { foreignKey: 'organizer', as: 'eventsOrganized' });
Event.belongsTo(User, { foreignKey: 'organizer', as: 'organizerDetails' });

User.hasMany(Volunteer, { foreignKey: 'registeredBy', as: 'volunteersRegistered' });
Volunteer.belongsTo(User, { foreignKey: 'registeredBy', as: 'registeredByDetails' });

module.exports = {
  User,
  Beneficiary,
  Donation,
  Event,
  Volunteer
};