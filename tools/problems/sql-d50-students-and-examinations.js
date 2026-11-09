const { tbl, para } = require('../build_problems.js');
const out = (columns, rows) => ({ columns, rows });
const students = (rows) => tbl('students', 'student_id INT, student_name VARCHAR', rows);
const subjects = (names) => tbl('subjects', 'subject_name VARCHAR', names.map((n) => [n]));
const examinations = (rows) => tbl('examinations', 'student_id INT, subject_name VARCHAR', rows);
const cols = ['student_id', 'student_name', 'subject_name', 'attended_exams'];

module.exports = {
  id: 'sql-d50-students-and-examinations', day: 50, lc: 'students-and-examinations', anchor: 'LC 1280', cat: 'PRACTICE', bounty: 20, lang: 'sql',
  title: 'Students and Examinations', kind: 'select', ordered: true,
  schema: [
    'students(student_id INT, student_name VARCHAR)   -- student_id is unique',
    'subjects(subject_name VARCHAR)   -- subject_name is unique',
    'examinations(student_id INT, subject_name VARCHAR)   -- one row each time a student sat an exam; can repeat',
  ],
  statement: para(
    'Every student is enrolled in **every** subject. `examinations` records each time a student sat an exam in a subject, so the same pair can appear many times.',
    'Return one row for **every combination** of student and subject, with the number of times that student sat that subject\'s exam. If they never sat it, the number is `0`.',
    'Return `student_id`, `student_name`, `subject_name` and `attended_exams`, ordered by `student_id` and then by `subject_name`.'
  ),
  starter: '-- Return: student_id, student_name, subject_name, attended_exams  (ordered)\nSELECT\n',
  solution: [
    'SELECT st.student_id, st.student_name, su.subject_name,',
    '       COUNT(e.subject_name) AS attended_exams',
    'FROM students st',
    'CROSS JOIN subjects su',
    'LEFT JOIN examinations e',
    '  ON e.student_id = st.student_id AND e.subject_name = su.subject_name',
    'GROUP BY st.student_id, st.student_name, su.subject_name',
    'ORDER BY st.student_id, su.subject_name',
  ].join('\n'),
  mutants: [
    { name: 'skips the pairs that were never examined', code: 'SELECT st.student_id, st.student_name, e.subject_name, COUNT(*) AS attended_exams FROM students st JOIN examinations e ON e.student_id = st.student_id GROUP BY st.student_id, st.student_name, e.subject_name ORDER BY st.student_id, e.subject_name' },
    { name: 'shows 1 instead of 0 for a subject never sat', code: 'SELECT st.student_id, st.student_name, su.subject_name, COUNT(*) AS attended_exams FROM students st CROSS JOIN subjects su LEFT JOIN examinations e ON e.student_id = st.student_id AND e.subject_name = su.subject_name GROUP BY st.student_id, st.student_name, su.subject_name ORDER BY st.student_id, su.subject_name' },
    { name: 'matches exams on the student only, so every subject gets the same count', code: 'SELECT st.student_id, st.student_name, su.subject_name, COUNT(e.subject_name) AS attended_exams FROM students st CROSS JOIN subjects su LEFT JOIN examinations e ON e.student_id = st.student_id GROUP BY st.student_id, st.student_name, su.subject_name ORDER BY st.student_id, su.subject_name' },
  ],
  hints: [
    'The result must contain pairs that appear nowhere in examinations. So the full list of pairs has to be built from students and subjects, not from the exam log.',
    'CROSS JOIN students with subjects to get every (student, subject) pair. Then LEFT JOIN the exam log on both the student and the subject.',
    'COUNT(e.subject_name) counts only real exam rows. An unmatched pair has NULL there, so it counts 0. GROUP BY the three label columns.',
  ],
  approach: para(
    '**Trigger:** "every combination, even the ones with nothing". **Pattern:** build the **grid** with `CROSS JOIN`, `LEFT JOIN` the facts onto it, count a column from the fact side. **Complexity:** students x subjects rows.',
    'The grid is the skeleton of the answer, and the log only fills the numbers in. That is why the log is on the right of a `LEFT JOIN`.',
    'Join on **both** keys. If you join on the student alone, every subject row picks up all of that student\'s exams.',
    '`COUNT(*)` would give 1 for an empty pair, because the left row itself counts. `COUNT(e.subject_name)` skips `NULL`.'
  ),
  cases: [
    {
      tables: [students([[1, 'Alice'], [2, 'Bob']]), subjects(['Math', 'Physics']), examinations([[1, 'Math'], [1, 'Math'], [1, 'Physics'], [2, 'Physics']])],
      expect: out(cols, [[1, 'Alice', 'Math', 2], [1, 'Alice', 'Physics', 1], [2, 'Bob', 'Math', 0], [2, 'Bob', 'Physics', 1]]),
    },
    { hidden: true, tables: [students([[1, 'Solo']]), subjects(['Art']), examinations([])], expect: out(cols, [[1, 'Solo', 'Art', 0]]) },
    {
      hidden: true,
      tables: [students([[2, 'Bea'], [1, 'Abe']]), subjects(['Zoo', 'Art']), examinations([[2, 'Zoo'], [2, 'Zoo'], [2, 'Zoo'], [1, 'Art']])],
      expect: out(cols, [[1, 'Abe', 'Art', 1], [1, 'Abe', 'Zoo', 0], [2, 'Bea', 'Art', 0], [2, 'Bea', 'Zoo', 3]]),
    },
    { hidden: true, tables: [students([]), subjects(['Math']), examinations([])], expect: out(cols, []) },
  ],
};
