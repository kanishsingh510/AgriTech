// const express = require('express');
// const path = require('path');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const methodOverride = require('method-override');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const connectDB = require('./config/db');

// dotenv.config();

// const app = express();

// // DB will be connected in bootstrap

// // View engine
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// // Middleware
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(methodOverride('_method'));

// // Sessions will be initialized after DB connect in bootstrap

// // Locals for views
// app.use((req, res, next) => {
//   res.locals.currentUser = req.session.user || null;
//   res.locals.role = req.session.user?.role || null;
//   next();
// });

// // Routes
// const authRoutes = require('./routes/auth');
// const farmerRoutes = require('./routes/farmer');
// const buyerRoutes = require('./routes/buyer');
// const paymentRoutes = require('./routes/payment');

// app.use('/', authRoutes);
// app.use('/farmer', farmerRoutes);
// app.use('/buyer', buyerRoutes);
// app.use('/payment', paymentRoutes);

// // Home
// app.get('/', (req, res) => {
//   res.render('home');
// });

// // Error handling
// // eslint-disable-next-line no-unused-vars
// app.use((err, req, res, next) => {
//   console.error("Server Error:", err.message);
//   res.status(err.status || 500).send('Something went wrong. Please try again.');
// });

// const PORT = process.env.PORT || 5000;

// async function bootstrap() {
//   await connectDB();

//   app.use(
//     session({
//       secret: process.env.SESSION_SECRET || 'agri-tech-secret',
//       resave: false,
//       saveUninitialized: false,
//       cookie: { maxAge: 1000 * 60 * 60 * 24 },
//       store: MongoStore.create({ client: mongoose.connection.getClient(), collectionName: 'sessions' })
//     })
//   );

//   try {
//     const server = app.listen(PORT, () => {
//       console.log(` Server running on http://localhost:${PORT}`);
//     });
//     server.on('error', (err) => {
//       console.error('Server listen error:', err.message);  
//       process.exit(1);
//     });
//   } catch (err) {
//     console.error('Failed to bind server:', err.message);
//     process.exit(1);
//   }
// }

// bootstrap().catch((err) => {
//   console.error('Failed to start server:', err.message);
//   process.exit(1);
// });


const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

let PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDB();

  // ✅ Initialize session after DB connection
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'agri-tech-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        collectionName: 'sessions'
      })
    })
  );

  // ✅ Make session data accessible to views
  app.use((req, res, next) => {
    res.locals.currentUser = req.session?.user || null;
    res.locals.role = req.session?.user?.role || null;
    next();
  });

  // Home route
  app.get('/', (req, res) => {
    res.render('home');
  });

  // Import routes
  const authRoutes = require('./routes/auth');
  const farmerRoutes = require('./routes/farmer');
  const buyerRoutes = require('./routes/buyer');
  const paymentRoutes = require('./routes/payment');
  const productRoutes = require('./routes/product');

  // Use routes
  app.use('/', authRoutes);
  app.use('/farmer', farmerRoutes);
  app.use('/buyer', buyerRoutes);
  app.use('/payment', paymentRoutes);
  app.use('/products', productRoutes);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(err.status || 500).send('Something went wrong. Please try again.');
  });

  // 🧠 Auto-Free Port Logic
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`✅ MongoDB Connected (Local)`);
      console.log(`🚀 Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is busy, trying next port...`);
        startServer(port + 1);
      } else {
        console.error('❌ Server listen error:', err.message);
        process.exit(1);
      }
    });
  };

  // Start server
  startServer(PORT);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
