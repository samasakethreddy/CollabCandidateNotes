const Note = require('../models/Note');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.createNote = async (req, res, io) => {
  const { message } = req.body;
  const { candidateId } = req.params;
  const author = req.user.id;

  console.log('Creating note:', { message, candidateId, author });
  console.log('Current user:', { id: req.user.id, name: req.user.name, email: req.user.email });

  try {
    const note = new Note({
      candidate: candidateId,
      author,
      message,
    });

    await note.save();
    console.log('Note saved to database:', note._id);

    // Populate author for the emitted note
    const populatedNote = await Note.findById(note._id).populate('author', 'name');
    console.log('Populated note:', populatedNote);

    // Handle tagging
    const taggedUsers = [];
    const regex = /@\s*(\w+)/g; // Match @, optional spaces, then word characters (username)
    let match;
    while ((match = regex.exec(message)) !== null) {
      taggedUsers.push(match[1]); // match[1] is the captured group (the username)
    }

    console.log('Tagged users found:', taggedUsers);

    if (taggedUsers.length > 0) { // Check if any users were tagged
      for (const username of taggedUsers) {
        console.log(`Looking for user with name: "${username}"`);
        const user = await User.findOne({ name: username });
        if (user) {
          console.log(`Found user: ${user.name} (${user._id})`);
          const notification = new Notification({
            user: user._id,
            note: note._id,
          });
          await notification.save();
          console.log(`Created notification: ${notification._id}`);
          
          const populatedNotification = await Notification.findById(notification._id).populate({
            path: 'note',
            populate: {
              path: 'candidate',
              select: 'name'
            }
          });
          console.log(`Emitting new_notification to user room: ${user._id.toString()}`);
          console.log('Populated notification:', populatedNotification);
          io.to(user._id.toString()).emit('new_notification', populatedNotification);
        } else {
          console.log(`User not found: "${username}"`);
        }
      }
    } else {
      console.log('No tagged users found in message');
    }

    console.log(`Emitting new_note to room ${candidateId}:`, populatedNote);
    io.to(candidateId).emit('new_note', populatedNote); // Emit the populated note
    console.log(`Server emitted new_note to room ${candidateId}:`, populatedNote);
    res.json(populatedNote); // Send the populated note back to the client
  } catch (err) {
    console.error('Error creating note:', err.message);
    res.status(500).send('Server error');
  }
};

exports.getNotes = async (req, res) => {
  const { candidateId } = req.params;

  try {
    const notes = await Note.find({ candidate: candidateId }).populate('author', 'name');
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
