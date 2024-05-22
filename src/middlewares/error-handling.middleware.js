export default function (err, req, res, next) {
  if (err.isJoi) {
    return res.status(400).json({ errorMessage: err.message });
  }

  if (err.code === 'P2002') {
    return res
      .status(400)
      .json({ errorMessage: '이미 존재하는 이메일입니다.' });
  }
  res.status(500).json({ errorMessage: err.message ?? '뭔에러람' });
}
