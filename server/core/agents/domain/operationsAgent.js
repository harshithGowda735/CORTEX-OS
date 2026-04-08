const { emitAgentActivity } = require('../../socket/socketHandler');

const manageOperations = async (context) => {
  const { query, userId } = context;
  emitAgentActivity(userId, { agent: 'Operations Agent', message: 'Checking staff availability and bed occupancy...', status: 'thinking' });
  
  await new Promise(resolve => setTimeout(resolve, 1800));

  let response = {
    domain: 'Operations',
    availableDoctors: [
      { name: 'Dr. Sarah Chen', spec: 'Cardiology', status: 'Available' },
      { name: 'Dr. Michael Ross', spec: 'General Medicine', status: 'In Surgery' }
    ],
    bedOccupancy: '85%',
    assignedDoctor: 'Dr. Sarah Chen'
  };

  emitAgentActivity(userId, { agent: 'Operations Agent', message: 'Staff and resources assigned.', status: 'done' });
  context.results.operations = response;
  return response;
};

module.exports = { manageOperations };
