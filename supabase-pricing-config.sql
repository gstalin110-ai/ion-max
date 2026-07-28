-- Tabla de configuración de precios y planes de suscripción
-- Sistema de cobro mensual configurable para IÓN MAX

-- Tabla de configuración de precios globales
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  annual_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de suscripciones de usuarios
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Insertar configuración inicial de precios
INSERT INTO pricing_config (key, value, description) VALUES
  ('owner_monthly_fee', '0.00', 'Tarifa mensual del dueño de la plataforma (configurable)'),
  ('user_monthly_fee', '0.00', 'Tarifa mensual por usuario (configurable)'),
  ('seller_monthly_fee', '0.00', 'Tarifa mensual por vendedor (configurable)'),
  ('commission_rate', '0.05', 'Tasa de comisión por transacción (5%)'),
  ('currency', 'USD', 'Moneda predeterminada')
ON CONFLICT (key) DO NOTHING;

-- Insertar plan gratuito inicial
INSERT INTO subscription_plans (name, description, monthly_price, annual_price, features, is_active) VALUES
  ('Plan Gratuito', 'Acceso básico a IÓN MAX', 0.00, 0.00, 
   '["Publicar hasta 5 listings", "Acceso a comunidad", "Soporte por email"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Insertar plan premium inicial
INSERT INTO subscription_plans (name, description, monthly_price, annual_price, features, is_active) VALUES
  ('Plan Premium', 'Acceso completo a IÓN MAX', 3.00, 30.00,
   '["Listings ilimitados", "Acceso a comunidad", "Soporte prioritario", "Analytics avanzados", "API access"]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Políticas RLS para pricing_config
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo el dueño puede ver pricing_config"
  ON pricing_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

CREATE POLICY "Solo el dueño puede actualizar pricing_config"
  ON pricing_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

CREATE POLICY "Solo el dueño puede insertar pricing_config"
  ON pricing_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- Políticas RLS para subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver planes activos"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Solo el dueño puede gestionar planes"
  ON subscription_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- Políticas RLS para user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propia suscripción"
  ON user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "El dueño puede ver todas las suscripciones"
  ON user_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

CREATE POLICY "El sistema puede crear suscripciones"
  ON user_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "El sistema puede actualizar suscripciones"
  ON user_subscriptions FOR UPDATE
  USING (true);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
