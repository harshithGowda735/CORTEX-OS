const UserModel = require('../models/UserModel');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const triggerSOS = async (req, res) => {
  try {
    const { userId, location } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.emergencyContacts || user.emergencyContacts.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No emergency contacts found. Please add protectors in your settings.' 
      });
    }

    const io = req.app.get('io');

    // 1. Send emails to all protectors
    const emailPromises = user.emergencyContacts.map(contact => {
      return resend.emails.send({
        from: 'CORTEX-OS <notifications@resend.dev>',
        to: contact.email,
        subject: `🚨 EMERGENCY: SOS Alert from ${user.name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid red; border-radius: 10px;">
            <h1 style="color: red;">CRITICAL EMERGENCY ALERT</h1>
            <p>Your contact, <strong>${user.name}</strong>, has triggered an SOS alert via CORTEX-OS.</p>
            <p><strong>Action Required:</strong> Please attempt to contact them immediately.</p>
            <div style="background: #f1f1f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Last Known Location:</strong> ${location?.lat ? `${location.lat}, ${location.lng}` : 'Coordinates Unknown'}</p>
              ${location?.lat ? `<a href="https://www.google.com/maps?q=${location.lat},${location.lng}" style="display: inline-block; padding: 10px 20px; background: red; color: white; text-decoration: none; border-radius: 5px;">View on Google Maps</a>` : ''}
            </div>
            <p style="font-size: 12px; color: #666;">This is an automated emergency signal from the CORTEX-OS Autonomous MCP Suite.</p>
          </div>
        `
      });
    });

    await Promise.all(emailPromises);

    // 2. Emit Socket events to Hospital Command Center
    if (io) {
      io.emit('hospital-alert', {
        userId,
        type: 'emergency',
        message: `🚨 CRITICAL SOS: ${user.name} has triggered a global emergency signal!`,
        location: location,
        timestamp: new Date()
      });

      io.emit('agent-activity', {
        agent: 'SOS Guardian',
        message: `Alert emails dispatched to ${user.emergencyContacts.length} protectors for ${user.name}.`,
        status: 'done'
      });
    }

    return res.json({ 
      success: true, 
      message: `SOS Signal successfully broadcasted to ${user.emergencyContacts.length} protectors.` 
    });

  } catch (error) {
    console.error('SOS Trigger Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addEmergencyContact = async (req, res) => {
    try {
        const { userId, name, email, phone } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Identity missing. Please re-authenticate.' });
        }

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $push: { emergencyContacts: { name, email, phone } } },
            { new: true }
        );
        res.json({ success: true, contacts: user.emergencyContacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { triggerSOS, addEmergencyContact };
