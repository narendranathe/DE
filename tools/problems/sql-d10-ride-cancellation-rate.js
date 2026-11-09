const { tbl, D, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const members = (rows) => tbl('members', 'member_id INT, banned VARCHAR, role VARCHAR', rows);
const rides = (rows) => tbl('rides', 'ride_id INT, rider_id INT, driver_id INT, status VARCHAR, ride_date DATE', rows.map((r) => [r[0], r[1], r[2], r[3], D(r[4])]));
const cols = ['ride_date', 'cancellation_rate'];

module.exports = {
  id: 'sql-d10-ride-cancellation-rate', day: 10, anchor: 'LC 262', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Trips and Users', kind: 'select', ordered: false,
  schema: [
    "members(member_id INT, banned VARCHAR, role VARCHAR)   -- banned is 'Yes' or 'No'",
    "rides(ride_id INT, rider_id INT, driver_id INT, status VARCHAR, ride_date DATE)   -- status: 'completed', 'cancelled_by_driver', 'cancelled_by_rider'",
  ],
  statement: para(
    'A ride is **cancelled** when its status is `cancelled_by_driver` or `cancelled_by_rider`. It is **completed** otherwise.',
    'For each day from **2013-10-01 to 2013-10-03**, find the cancellation rate: cancelled rides divided by all rides on that day, rounded to 2 decimals.',
    'Count a ride only if **neither** its rider **nor** its driver is banned. Days with no counted rides do not appear.',
    'Return `ride_date` and `cancellation_rate`.'
  ),
  starter: '-- Return: ride_date, cancellation_rate\nSELECT\n',
  solution: [
    'SELECT r.ride_date,',
    "       ROUND(AVG(CASE WHEN r.status = 'completed' THEN 0.0 ELSE 1.0 END), 2) AS cancellation_rate",
    'FROM rides r',
    "JOIN members rider  ON rider.member_id  = r.rider_id  AND rider.banned  = 'No'",
    "JOIN members driver ON driver.member_id = r.driver_id AND driver.banned = 'No'",
    "WHERE r.ride_date BETWEEN DATE '2013-10-01' AND DATE '2013-10-03'",
    'GROUP BY r.ride_date',
  ].join('\n'),
  mutants: [
    { name: 'checks only whether the rider is banned', slipsPastSamples: true, code: "SELECT r.ride_date, ROUND(AVG(CASE WHEN r.status = 'completed' THEN 0.0 ELSE 1.0 END), 2) AS cancellation_rate FROM rides r JOIN members rider ON rider.member_id = r.rider_id AND rider.banned = 'No' WHERE r.ride_date BETWEEN DATE '2013-10-01' AND DATE '2013-10-03' GROUP BY r.ride_date" },
    { name: 'counts only cancellations by the driver', slipsPastSamples: true, code: "SELECT r.ride_date, ROUND(AVG(CASE WHEN r.status = 'cancelled_by_driver' THEN 1.0 ELSE 0.0 END), 2) AS cancellation_rate FROM rides r JOIN members rider ON rider.member_id = r.rider_id AND rider.banned = 'No' JOIN members driver ON driver.member_id = r.driver_id AND driver.banned = 'No' WHERE r.ride_date BETWEEN DATE '2013-10-01' AND DATE '2013-10-03' GROUP BY r.ride_date" },
    { name: 'forgets the date window', slipsPastSamples: true, code: "SELECT r.ride_date, ROUND(AVG(CASE WHEN r.status = 'completed' THEN 0.0 ELSE 1.0 END), 2) AS cancellation_rate FROM rides r JOIN members rider ON rider.member_id = r.rider_id AND rider.banned = 'No' JOIN members driver ON driver.member_id = r.driver_id AND driver.banned = 'No' GROUP BY r.ride_date" },
    { name: 'divides whole numbers, so every rate rounds down to 0 or 1', code: "SELECT r.ride_date, ROUND(SUM(CASE WHEN r.status = 'completed' THEN 0 ELSE 1 END) // COUNT(*), 2) AS cancellation_rate FROM rides r JOIN members rider ON rider.member_id = r.rider_id AND rider.banned = 'No' JOIN members driver ON driver.member_id = r.driver_id AND driver.banned = 'No' WHERE r.ride_date BETWEEN DATE '2013-10-01' AND DATE '2013-10-03' GROUP BY r.ride_date" },
  ],
  hints: [
    'Two things shrink the set of rides before you count: banned people and the date window. Decide which rides are "in" first.',
    'Join members twice, once as the rider and once as the driver, and require banned = \'No\' on both joins.',
    'After grouping by day, the rate is the average of a 1-or-0 flag that is 1 for a cancelled ride. Round that average to 2 places.',
  ],
  approach: para(
    'Filter both sides of the join, then aggregate. The rider and the driver are two different rows in `members`, so the table is joined twice with a different alias each time.',
    'The rate is `AVG(cancelled_flag)`. Writing the flag as 1.0 or 0.0 avoids whole-number division.',
    'A banned person on **either** side removes the ride, and the date window is part of the question.'
  ),
  cases: [
    {
      tables: [
        members([[1, 'No', 'rider'], [2, 'Yes', 'rider'], [3, 'No', 'rider'], [4, 'No', 'rider'], [10, 'No', 'driver'], [11, 'No', 'driver'], [12, 'No', 'driver'], [13, 'No', 'driver']]),
        rides([
          [1, 1, 10, 'completed', '2013-10-01'], [2, 2, 11, 'cancelled_by_driver', '2013-10-01'], [3, 3, 12, 'completed', '2013-10-01'], [4, 4, 13, 'cancelled_by_driver', '2013-10-01'],
          [5, 1, 10, 'completed', '2013-10-02'], [6, 2, 11, 'completed', '2013-10-02'], [7, 3, 12, 'completed', '2013-10-02'],
          [8, 2, 12, 'completed', '2013-10-03'], [9, 3, 10, 'completed', '2013-10-03'], [10, 4, 13, 'cancelled_by_driver', '2013-10-03'],
        ]),
      ],
      expect: out(cols, [['2013-10-01', 0.33], ['2013-10-02', 0], ['2013-10-03', 0.5]]),
    },
    {
      hidden: true,
      tables: [members([[1, 'No', 'rider'], [5, 'Yes', 'driver'], [6, 'No', 'driver']]), rides([[1, 1, 5, 'cancelled_by_rider', '2013-10-01'], [2, 1, 6, 'completed', '2013-10-01']])],
      expect: out(cols, [['2013-10-01', 0]]),
    },
    {
      hidden: true,
      tables: [members([[1, 'No', 'rider'], [2, 'No', 'driver']]), rides([[1, 1, 2, 'completed', '2013-09-30'], [2, 1, 2, 'cancelled_by_rider', '2013-10-02'], [3, 1, 2, 'cancelled_by_driver', '2013-10-02'], [4, 1, 2, 'completed', '2013-10-04']])],
      expect: out(cols, [['2013-10-02', 1]]),
    },
    {
      hidden: true,
      tables: [members([[1, 'Yes', 'rider'], [2, 'No', 'driver'], [3, 'No', 'rider']]), rides([[1, 1, 2, 'completed', '2013-10-01'], [2, 3, 2, 'completed', '2013-10-03']])],
      expect: out(cols, [['2013-10-03', 0]]),
    },
  ],
};
