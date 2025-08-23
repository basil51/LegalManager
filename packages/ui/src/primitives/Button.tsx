
import * as React from 'react';

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'rounded-xl px-4 py-2 shadow-sm border ms-0 ' +
        (props.className ?? '')
      }
    />
  );
}
