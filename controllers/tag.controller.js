import Tag from '../models/tag.model.js';

// CREATE a new tag
export const createTag = async (req, res) => {
  try {
    const tag = new Tag(req.body);
    const saved = await tag.save();
    res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Tag name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// GET one tag by ID
export const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all tags
export const getAllTags = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    const query = {};
    
    // Text search
    if (search) {
      query.name = new RegExp(search, 'i');
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tags = await Tag.find(query).sort(sortConfig);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE tag
export const updateTag = async (req, res) => {
  try {
    const updated = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Tag not found' });
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Tag name already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// DELETE tag
export const deleteTag = async (req, res) => {
  try {
    const deleted = await Tag.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Tag not found' });
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
