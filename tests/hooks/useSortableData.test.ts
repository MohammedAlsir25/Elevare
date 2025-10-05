import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSortableData } from '../../hooks/useSortableData.ts';

const testData = [
  { id: 1, name: 'Charlie', age: 30, nested: { value: 100 } },
  { id: 2, name: 'Alice', age: 25, nested: { value: 300 } },
  { id: 3, name: 'Bob', age: 35, nested: { value: 200 } },
];

describe('useSortableData', () => {
  it('should return items unsorted by default', () => {
    const { result } = renderHook(() => useSortableData(testData));
    expect(result.current.items).toEqual(testData);
  });

  it('should sort by a top-level key in ascending order', () => {
    const { result } = renderHook(() => useSortableData(testData));

    act(() => {
      result.current.requestSort('name');
    });

    expect(result.current.items[0].name).toBe('Alice');
    expect(result.current.items[1].name).toBe('Bob');
    expect(result.current.items[2].name).toBe('Charlie');
    expect(result.current.sortConfig).toEqual({ key: 'name', direction: 'ascending' });
  });

  it('should toggle to descending order on second sort request', () => {
    const { result } = renderHook(() => useSortableData(testData));

    act(() => {
      result.current.requestSort('age');
    });
    act(() => {
      result.current.requestSort('age');
    });

    expect(result.current.items[0].age).toBe(35);
    expect(result.current.items[1].age).toBe(30);
    expect(result.current.items[2].age).toBe(25);
    expect(result.current.sortConfig).toEqual({ key: 'age', direction: 'descending' });
  });

  it('should sort by a nested key', () => {
    const { result } = renderHook(() => useSortableData(testData));

    act(() => {
      result.current.requestSort('nested.value');
    });

    expect(result.current.items[0].nested.value).toBe(100);
    expect(result.current.items[1].nested.value).toBe(200);
    expect(result.current.items[2].nested.value).toBe(300);
  });
});