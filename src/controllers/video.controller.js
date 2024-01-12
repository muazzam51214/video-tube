const addVideo = (req, res, next) => {
  try {
    res.status(200).json({
      message : "Message From Video"
    })
    next();
  } catch (error) {
    console.error("Error Adding Video:", error);
    next(error);
  }
};

export { addVideo };
