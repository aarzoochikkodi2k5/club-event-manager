import { useState } from 'react';

export default function PasswordInput({ value, onChange, name = 'password' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
      />
      <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}