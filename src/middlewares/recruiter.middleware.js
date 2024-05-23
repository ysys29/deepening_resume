export default async function (req, res, next) {
  try {
    const { role } = req.user;
    if (role !== 'RECRUITER') {
      return res.status(403).json({ errorMessage: '접근 권한이 없습니다.' });
    }
    next();
  } catch (error) {
    next(error);
  }
}
