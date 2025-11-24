'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface SubscriptionFormProps {
  productId: string;
  productName: string;
  productUnit: string;
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  productId,
  productName,
  productUnit,
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [alertType, setAlertType] = useState<'price_drop' | 'new_vendor' | 'weekly_digest' | 'all'>('all');
  const [alertThreshold, setAlertThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          productId,
          alertType,
          alertThreshold: alertThreshold ? parseFloat(alertThreshold) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setAlertThreshold('');
      } else {
        setError(data.error || 'Failed to create subscription');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Subscription Created!">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Almost Done!
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            We've sent a verification email to <strong>{email}</strong>. 
            Please check your inbox and click the verification link to activate your price alerts.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              You'll receive alerts for <strong>{productName}</strong> when:
            </p>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              {alertType === 'all' && (
                <>
                  <li>• Prices drop significantly</li>
                  <li>• New vendors are added</li>
                  <li>• Weekly price summaries</li>
                </>
              )}
              {alertType === 'price_drop' && <li>• Prices drop significantly</li>}
              {alertType === 'new_vendor' && <li>• New vendors are added</li>}
              {alertType === 'weekly_digest' && <li>• Weekly price summaries</li>}
              {alertThreshold && (
                <li>• Price drops below ${parseFloat(alertThreshold).toFixed(4)}/{productUnit}</li>
              )}
            </ul>
          </div>
          <Button variant="bronze" onClick={handleClose} className="mt-6">
            Got it!
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Get Price Alerts">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Subscribe to {productName} Alerts
          </h3>
          <p className="text-[var(--text-secondary)] text-sm">
            Get notified when prices drop or new vendors are added. We'll never spam you.
          </p>
        </div>

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          error={error}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            Alert Type
          </label>
          <select
            className="input-dark w-full"
            value={alertType}
            onChange={(e) => setAlertType(e.target.value as any)}
          >
            <option value="all">All alerts (recommended)</option>
            <option value="price_drop">Price drops only</option>
            <option value="new_vendor">New vendors only</option>
            <option value="weekly_digest">Weekly digest only</option>
          </select>
        </div>

        <Input
          label={`Price Alert Threshold (optional)`}
          type="number"
          step="0.0001"
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(e.target.value)}
          placeholder={`e.g., 0.0150 (per ${productUnit})`}
          helperText={`Get alerted when price drops below this amount per ${productUnit}`}
        />

        <div className="bg-[var(--bg-tertiary)] p-4 rounded-lg">
          <h4 className="font-semibold text-[var(--text-primary)] mb-2">What you'll get:</h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            <li>• Instant alerts when prices drop</li>
            <li>• New vendor notifications</li>
            <li>• Weekly price summaries</li>
            <li>• Best deal recommendations</li>
            <li>• Easy unsubscribe anytime</li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            variant="malachite"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Creating...' : '🔔 Subscribe to Alerts'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center">
          By subscribing, you agree to receive price alerts via email. 
          You can unsubscribe at any time.
        </p>
      </form>
    </Modal>
  );
};

export default SubscriptionForm;
