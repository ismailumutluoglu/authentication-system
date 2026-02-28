import xss from 'xss';

export const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = JSON.parse(
      JSON.stringify(req.body).replace(/\$/g, '_') // sadece $ değiştir, . değil
    );
  }
  next();
};

export const xssSanitize = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string' && key !== 'email') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};