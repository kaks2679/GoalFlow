import React from 'react';

function PasswordStrengthMeter({ password }) {
  const calculateStrength = (pwd) => {
    let strength = 0;
    
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    
    return strength;
  };

  const getStrengthInfo = (strength) => {
    if (strength <= 2) {
      return { text: 'Weak', color: 'bg-red-500', width: '33%' };
    } else if (strength <= 4) {
      return { text: 'Medium', color: 'bg-yellow-500', width: '66%' };
    } else {
      return { text: 'Strong', color: 'bg-green-500', width: '100%' };
    }
  };

  if (!password) return null;

  const strength = calculateStrength(password);
  const info = getStrengthInfo(strength);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password Strength:</span>
        <span className={`text-xs font-semibold ${
          info.color === 'bg-red-500' ? 'text-red-600' :
          info.color === 'bg-yellow-500' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {info.text}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${info.color} transition-all duration-300`}
          style={{ width: info.width }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {strength < 5 && (
          <span>
            Try adding {strength < 3 && 'more characters, '}
            {!/[a-z]/.test(password) || !/[A-Z]/.test(password) ? 'uppercase & lowercase, ' : ''}
            {!/\d/.test(password) ? 'numbers, ' : ''}
            {!/[^a-zA-Z0-9]/.test(password) ? 'special characters' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export default PasswordStrengthMeter;
