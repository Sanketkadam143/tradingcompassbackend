import User from "../models/user.js";

export const getRegistration = async (req, res) => {
  const userId = req.userId;
  try {
    const registration = await User.find({ _id: userId }, { contest: 1 });
    return res.status(200).json({ isregister: registration[0].contest });
  } catch (error) {
    res.status(500).json({ message: "Unable to get Registration Details" });
    console.log(error);
  }
};

export const registration = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findOne({ _id: userId }, { contest: 1 });
    user.contest = !user.contest;
    await user.save();
    return res.status(200).json({
      isregister: user.contest,
      successMessage: `${user.contest ? "Successfully Participated":"Successfully Unregistered"}`,
    });
    
  } catch (error) {
    res.status(500).json({ message: "Try Again" });
    console.log(error);
  }
};
