const supabase = require('../config/db');
const logger = require('../utils/logger');

const DisasterController = {
  async createDisaster(req, res) {
    try {
      const { title, description, tags, location_name } = req.body;
      const user_id = req.user.id; // From auth middleware

      // First insert the disaster record
      const { data: disaster, error: disasterError } = await supabase
        .from('disasters')
        .insert([
          {
            title,
            description,
            tags,
            location_name,
            owner_id: user_id,
            audit_trail: [
              {
                action: 'create',
                user_id,
                timestamp: new Date().toISOString()
              }
            ]
          }
        ])
        .select();

      if (disasterError) throw disasterError;

      logger.log(`Disaster created: ${title} by ${user_id}`);
      res.status(201).json(disaster[0]);
    } catch (error) {
      logger.error(`Create disaster error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },

  async getDisasters(req, res) {
    try {
      const { tag } = req.query;
      let query = supabase.from('disasters').select('*');

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      const { data, error } = await query;

      if (error) throw error;
      res.json(data);
    } catch (error) {
      logger.error(`Get disasters error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },

  async updateDisaster(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user_id = req.user.id;

      // Get current disaster first
      const { data: current, error: currentError } = await supabase
        .from('disasters')
        .select('audit_trail')
        .eq('id', id)
        .single();

      if (currentError) throw currentError;

      const updatedAudit = [
        ...current.audit_trail,
        {
          action: 'update',
          user_id,
          timestamp: new Date().toISOString(),
          changes: updates
        }
      ];

      const { data, error } = await supabase
        .from('disasters')
        .update({
          ...updates,
          audit_trail: updatedAudit
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      logger.log(`Disaster updated: ${id} by ${user_id}`);
      res.json(data[0]);
    } catch (error) {
      logger.error(`Update disaster error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  },

  async deleteDisaster(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const { error } = await supabase
        .from('disasters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logger.log(`Disaster deleted: ${id} by ${user_id}`);
      res.status(204).send();
    } catch (error) {
      logger.error(`Delete disaster error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = DisasterController;
