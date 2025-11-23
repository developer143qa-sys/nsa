router.get('/logout', (req, res) => {
  // Destroy session
  req.session.destroy(err => {
    if (err) console.log(err);

    // Clear JWT cookie if used
    res.clearCookie('token');

    return res.redirect('/auth/login');
  });
});
