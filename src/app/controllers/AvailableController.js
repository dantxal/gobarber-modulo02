import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Invalid: not sending date query' });
    }

    const searchDate = Number(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const available = schedule.map(time => {
      const [hour, minutes] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minutes),
        0
      );
      /**
       * check if time is in the past
       */

      /**
       * Check if there is already an appointment at that time
       */

      return {
        time,
        value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json({
      providerId: req.params.providerId,
      dateReceived: [
        format(startOfDay(searchDate), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        format(endOfDay(searchDate), "yyyy-MM-dd'T'HH:mm:ssxxx"),
      ],
      date: available,
      appointments,
    });
  }
}

export default new AvailableController();
