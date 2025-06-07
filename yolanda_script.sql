-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 25-03-2025 a las 09:29:19
-- Versión del servidor: 10.11.6-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `yvlujan_proyecto`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `medico_id` int(11) NOT NULL,
  `horario_id` int(11) NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id`, `paciente_id`, `medico_id`, `horario_id`, `estado`) VALUES
(19, 1, 1, 3, 'pendiente'),
(22, 1, 3, 7, 'pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial`
--

CREATE TABLE `historial` (
  `id` int(11) NOT NULL,
  `paciente_id` int(11) NOT NULL,
  `diagnostico` text NOT NULL,
  `tratamiento` text NOT NULL,
  `fecha_registro` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `historial`
--

INSERT INTO `historial` (`id`, `paciente_id`, `diagnostico`, `tratamiento`, `fecha_registro`) VALUES
(1, 1, 'Hipertensión leve', 'Enfoque en dieta saludable y ejercicio regular.', '2025-03-21 16:17:06'),
(2, 1, 'Resfriado común', 'Descanso, líquidos y medicación para la fiebre.', '2025-03-21 16:17:06'),
(3, 1, 'Dolor lumbar', 'Fisioterapia y analgésicos.', '2025-03-21 16:17:06'),
(4, 2, 'Diabetes tipo 2', 'Medicamento oral y control de glucosa.', '2025-03-21 16:17:07'),
(5, 2, 'Alergia al polen', 'Antihistamínicos y evitar el contacto con alérgenos.', '2025-03-21 16:17:07'),
(6, 2, 'Problemas digestivos', 'Dieta balanceada y pruebas para detectar intolerancias alimenticias.', '2025-03-21 16:17:07'),
(7, 3, 'Gripe estacional', 'Descanso y medicación para la fiebre.', '2025-03-21 16:17:07'),
(8, 3, 'Migraña', 'Analgésicos y evitar luces brillantes.', '2025-03-21 16:17:07'),
(9, 3, 'Lesión muscular', 'Rehabilitación física y descanso.', '2025-03-21 16:17:07'),
(10, 4, 'Fractura de brazo', 'Yeso durante 6 semanas.', '2025-03-21 16:17:07'),
(11, 4, 'Contusión en la pierna', 'Reposo y aplicación de hielo.', '2025-03-21 16:17:07'),
(12, 4, 'Infección de oído', 'Antibióticos y analgésicos.', '2025-03-21 16:17:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `medico_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `disponible` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id`, `medico_id`, `fecha`, `hora_inicio`, `hora_fin`, `disponible`) VALUES
(1, 1, '2025-03-18', '08:00:00', '08:30:00', 1),
(2, 1, '2025-03-18', '08:30:00', '09:00:00', 1),
(3, 1, '2025-03-19', '10:00:00', '10:30:00', 0),
(4, 2, '2025-03-20', '09:00:00', '09:30:00', 1),
(5, 2, '2025-03-20', '09:30:00', '10:00:00', 1),
(6, 3, '2025-03-21', '14:00:00', '14:30:00', 1),
(7, 3, '2025-03-21', '14:30:00', '15:00:00', 0),
(8, 4, '2025-03-22', '16:00:00', '16:30:00', 1),
(9, 4, '2025-03-22', '16:30:00', '17:00:00', 1),
(10, 5, '2025-03-23', '11:00:00', '11:30:00', 1),
(11, 5, '2025-03-23', '11:30:00', '12:00:00', 1),
(12, 6, '2025-03-24', '13:00:00', '13:30:00', 1),
(13, 6, '2025-03-24', '13:30:00', '14:00:00', 1),
(14, 7, '2025-03-25', '17:00:00', '17:30:00', 1),
(15, 7, '2025-03-25', '17:30:00', '18:00:00', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicos`
--

CREATE TABLE `medicos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `especialidad` varchar(255) NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `calificacion` decimal(3,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `medicos`
--

INSERT INTO `medicos` (`id`, `usuario_id`, `especialidad`, `ubicacion`, `calificacion`) VALUES
(1, 1, 'Cardiología', 'Clínica Central', 4.50),
(2, 3, 'Pediatría', 'Hospital General', 4.70),
(3, 5, 'Dermatología', 'Clínica Norte', 4.30),
(4, 7, 'Pediatría', 'Hospital Infantil', 4.80),
(5, 9, 'Cardiología', 'Centro Médico Visión', 4.20),
(6, 11, 'Dermatología', 'Maternidad San José', 4.60),
(7, 13, 'Pediatría', 'Clínica del Deporte', 4.40),
(8, 15, 'Dermatología', 'Hospital UroCare', 4.10),
(9, 1, 'Cardiología', 'Centro de Salud Familiar', 4.00),
(10, 3, 'Dermatología', 'Instituto del Cáncer', 4.90),
(11, 5, 'Oftalmología', 'Hospital Mental', 4.50),
(12, 7, 'Oftalmología', 'Centro Hormonal', 4.30),
(13, 9, 'Pediatría', 'Hospital del Pulmón', 4.40),
(14, 11, 'Oftalmología', 'Clínica del Dolor', 4.20),
(15, 13, 'Oftalmología', 'Centro Digestivo', 4.60);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `tipo_usuario` enum('paciente','medico','admin') NOT NULL,
  `fecha_registro` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `telefono`, `password`, `tipo_usuario`, `fecha_registro`) VALUES
(1, 'Yolanda', 'Vera Luján', 'yveralujan@gmail.com', '666777888', '$2b$10$5L1sDucQdJaB6QEJKufVPOk9Q/CeM3XYvZdJKwmV0gGny8OQqxFjW', 'paciente', '2025-03-17 09:49:32'),
(2, 'Juan', 'Pérez', 'juan.perez@gmail.com', '123456789', 'clave123', 'medico', '2025-03-17 10:51:01'),
(3, 'María', 'López', 'maria.lopez@gmail.com', '987654321', 'clave123', 'paciente', '2025-03-17 10:51:01'),
(4, 'Carlos', 'Ramírez', 'carlos.ramirez@gmail.com', '112233445', 'clave123', 'medico', '2025-03-17 10:51:01'),
(5, 'Ana', 'Martínez', 'ana.martinez@gmail.com', '556677889', 'clave123', 'paciente', '2025-03-17 10:51:01'),
(6, 'Pedro', 'Gómez', 'pedro.gomez@gmail.com', '998877665', 'clave123', 'medico', '2025-03-17 10:51:01'),
(7, 'Laura', 'Fernández', 'laura.fernandez@gmail.com', '667788990', 'clave123', 'paciente', '2025-03-17 10:51:01'),
(8, 'Roberto', 'Díaz', 'roberto.diaz@gmail.com', '445566778', 'clave123', 'medico', '2025-03-17 10:51:01'),
(9, 'Sofía', 'Castro', 'sofia.castro@gmail.com', '223344556', 'clave123', 'paciente', '2025-03-17 10:51:01'),
(10, 'Miguel', 'Ruiz', 'miguel.ruiz@gmail.com', '334455667', 'clave123', 'medico', '2025-03-17 10:51:01'),
(11, 'Daniela', 'Hernández', 'daniela.hernandez@gmail.com', '778899001', 'clave123', 'paciente', '2025-03-17 10:51:01'),
(12, 'Alejandro', 'Morales', 'alejandro.morales@gmail.com', '990011223', 'clave123', 'medico', '2025-03-17 10:51:01'),
(13, 'Patricia', 'Ortega', 'patricia.ortega@gmail.com', '887766554', 'clave123', 'paciente', '2025-03-17 10:51:01'),
(14, 'José', 'Torres', 'jose.torres@gmail.com', '665544332', 'clave123', 'medico', '2025-03-17 10:51:01'),
(15, 'Andrea', 'Vargas', 'andrea.vargas@gmail.com', '554433221', 'clave123', 'paciente', '2025-03-17 10:51:01'),
(16, 'Luis', 'Navarro', 'luis.navarro@gmail.com', '332211009', 'clave123', 'admin', '2025-03-17 10:51:01'),
(17, 'Juan', 'PP', 'ppp@gmail.com', '555666777', '$2b$10$bQwDVmdtzGucpnR5.wUmR.EjjC2y2edahEyzmQc9EMY1DJ79AdZQW', 'medico', '2025-03-21 20:23:00'),
(18, 'Amparo', 'Gracia', 'ag@gmail.com', '778889999', '$2b$10$1pWcuNuXxKchLrye2fbVlOo2hLrIrScrZHvj0.PoDbbJ66eXxHtx2', 'paciente', '2025-03-23 10:16:32');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paciente_id` (`paciente_id`),
  ADD KEY `medico_id` (`medico_id`),
  ADD KEY `horario_id` (`horario_id`);

--
-- Indices de la tabla `historial`
--
ALTER TABLE `historial`
  ADD PRIMARY KEY (`id`),
  ADD KEY `paciente_id` (`paciente_id`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `medico_id` (`medico_id`);

--
-- Indices de la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `historial`
--
ALTER TABLE `historial`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `medicos`
--
ALTER TABLE `medicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_18` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_19` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_20` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial`
--
ALTER TABLE `historial`
  ADD CONSTRAINT `historial_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`medico_id`) REFERENCES `medicos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD CONSTRAINT `medicos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
