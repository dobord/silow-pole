# Алгоритмы

## Потенциал (фрагментный)
```
V = 0
for charge:
  d = p - pos
  r2 = dot(d,d)+eps2
  V += q / sqrt(r2)
Vc = compress(V)
color = palette(Vc)
```

## Силовые линии (Euler)
```
p = seed
for i in 0..MaxSteps:
  E = field(p)
  if |E| < Emin: break
  dir = normalize(E)
  p += h * dir
  store(p)
```

## Силовые линии (RK4)
(см. field-lines.md)

## Эквипотенциалы (периодическое)
```
scaled = (Vc - Vmin)/dV
edge = abs(fract(scaled)-0.5)
mask = step(edge, width)
color = mix(base, isoColor, mask)
```

## Компрессия
```
Vc = sign(V) * log(1 + a|V|)/log(1 + aVmax)
```

## Палитра (дивергентная)
```
t = 0.5 + 0.5 * Vc
color = mix(blue, red, t)
```

## Сложности
| Алгоритм | Сложность |
|----------|-----------|
| Потенциал | O(Pixels * Charges) |
| Линии | O(Seeds * Steps * Charges) |
| Изолинии (шейдер) | O(Pixels) |
| Marching Squares | O(Grid) |

## Оптимизации
- Кэширование поля: текстура.
- Адаптивный шаг интеграции.
- Предварительная сортировка зарядов (для spatial pruning) — опционально.
- Палитра через LUT.

---
