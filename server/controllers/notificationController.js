const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.user.id);
    
    const notifications = await Notification.find({ user: req.user.id })
      .populate({
        path: 'note',
        populate: {
          path: 'candidate',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).send('Server error');
  }
};

exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    console.log('Marking notification as read:', notificationId);
    
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      console.log('Notification not found:', notificationId);
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Check if the notification belongs to the current user
    if (notification.user.toString() !== req.user.id) {
      console.log('Unauthorized access to notification:', notificationId);
      return res.status(403).json({ msg: 'Not authorized' });
    }

    notification.read = true;
    await notification.save();
    
    console.log('Notification marked as read successfully');
    res.json({ msg: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).send('Server error');
  }
};
