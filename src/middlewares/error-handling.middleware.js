export default function (err, req, res, next) {
  console.error(err);

  res.status(500).json({ errorMessage: err.message ?? '뭔에러람' });
}
