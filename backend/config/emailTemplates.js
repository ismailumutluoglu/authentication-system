export const verificationEmailTemplate = (username, verificationUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: #1e3a5f; padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #444; line-height: 1.6; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0; }
    .footer { background: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Auth System</h1>
    </div>
    <div class="body">
      <p>Merhaba <strong>${username}</strong>,</p>
      <p>Hesabınızı doğrulamak için aşağıdaki butona tıklayın.</p>
      <p>Bu link <strong>24 saat</strong> geçerlidir.</p>
      <a href="${verificationUrl}" class="button">Hesabı Doğrula</a>
      <p>Butona tıklayamıyorsanız şu linki kopyalayın:</p>
      <p style="word-break:break-all;color:#3b82f6">${verificationUrl}</p>
    </div>
    <div class="footer">
      Bu emaili siz istemediyseniz görmezden gelebilirsiniz.
    </div>
  </div>
</body>
</html>
`;

export const passwordResetEmailTemplate = (username, resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
    .header { background: #1e3a5f; padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #444; line-height: 1.6; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0; }
    .footer { background: #f4f4f4; padding: 16px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Auth System</h1>
    </div>
    <div class="body">
      <p>Merhaba <strong>${username}</strong>,</p>
      <p>Şifre sıfırlama talebinde bulundunuz.</p>
      <p>Bu link <strong>1 saat</strong> geçerlidir.</p>
      <a href="${resetUrl}" class="button">Şifremi Sıfırla</a>
      <p>Butona tıklayamıyorsanız şu linki kopyalayın:</p>
      <p style="word-break:break-all;color:#ef4444">${resetUrl}</p>
      <p>Bu talebi siz yapmadıysanız emaili görmezden gelebilirsiniz.</p>
    </div>
    <div class="footer">
      Bu email otomatik gönderilmiştir.
    </div>
  </div>
</body>
</html>
`;