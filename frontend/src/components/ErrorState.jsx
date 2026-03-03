.wrapper {
  padding: 2.5rem 2.75rem;
  text-align: center;
  color: var(--danger);
  background: var(--danger-bg);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(248, 113, 113, 0.6);
}

.text {
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
}

.retry {
  background: transparent;
  color: var(--text);
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.55rem 1.3rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.retry:hover {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(148, 163, 184, 1);
  transform: translateY(-1px);
}
