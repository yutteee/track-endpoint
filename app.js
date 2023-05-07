const express = require("express");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const testAccount = {
  user_id: "TaroYamada",
  password: "PaSSwd4TY",
  nickname: "たろー",
  comment: "僕は元気です",
};

const accounts = [testAccount];

app.post("/signup", (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id) throw new Error("user_id is required");
    if (!password) throw new Error("password is required");

    if (password.length < 6) throw new Error("password is too short");

    if (accounts.some((account) => account.user_id === user_id))
      throw new Error("already same user_id is used");

    accounts.push({
      user_id: user_id,
      password: password,
      nickname: user_id,
      comment: "",
    });

    return res.status(200).send({
      message: "Account successfully created",
      user: {
        user_id: user_id,
        nickname: user_id,
      },
    });
  } catch (error) {
    return res.status(400).send({
      message: "Account creation failed",
      cause: error.message,
    });
  }
});

app.get("/users/:user_id", (req, res) => {
  try {
    const [user_id, password] = req.headers.authorization.split(":");

    // base64でエンコードされた文字列をデコード
    const decoded_user_id = atob(user_id);
    const decoded_password = atob(password);

    if (!decoded_user_id || !decoded_password) throw new Error("Authentication failed");

    const foundAccount = accounts.find(
      (account) => account.user_id === decoded_user_id && account.password === decoded_password
    );

    if (!foundAccount) throw new Error("No user found");

    // セキュリティのためパスワードは返さない
    const { password: _, ...filteredAccount } = foundAccount;

    return res.status(200).send({
      message: "User details by user_id",
      user: filteredAccount,
    });
  } catch (error) {
    if (error.message === "No user found") {
      return res.status(404).send({
        message: "No user found",
      });
    }

    if (error.message === "Authentication failed") {
      return res.status(401).send({
        message: "Authentication failed",
      });
    }
  }
});

app.listen(8000, () => console.log("listening on port 8000!"));
