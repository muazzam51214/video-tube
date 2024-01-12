const postTweet = (req, res, next) => {
  try {
    res.status(200).json({
      message : "Message from Tweet"
    })
    next();
  } catch (error) {
    console.error("Error Posting Tweet:", error);
    next(error);
  }
};

export { postTweet };
