# Шейдеры

(Исходные тексты шейдеров в репозитории во фрагментах не получены — здесь реконструкция и целевой дизайн.)

## Vertex Shader (fullscreen quad)

Цель: вывести два треугольника/квад на весь экран, передав UV координаты.

Псевдокод:
```
attribute vec3 aPosition;     // в пикселях: [-hw..+hw], [-hh..+hh]
attribute vec2 aTexcoord;
uniform vec2 uViewport;       // (width, height)
varying vec2 vUV;

void main() {
    vec2 ndc = (aPosition.xy / uViewport) * 2.0;
    gl_Position = vec4(ndc, 0.0, 1.0);
    vUV = aTexcoord;
}
```

## Fragment Shader (потенциал + окраска)

Uniform предполагаемые:
- uChargesPos[ MAX_CHARGES ] (vec2)
- uChargesQ[ MAX_CHARGES ]   (float)
- uChargeCount (int)
- uEps2 (float)
- uCompressA (float)
- uVmax (float)
- uShowIso (bool)
- uIsoMode (int)
- uIsoStep (float)
- uIsoWidth (float)
- uPaletteMode (int)

Псевдокод:
```
float potential(vec2 p) {
    float V = 0.0;
    for (int i=0; i<uChargeCount; ++i) {
        vec2 d = p - uChargesPos[i];
        float r2 = dot(d,d) + uEps2;
        V += uChargesQ[i] * inversesqrt(r2);
    }
    return V;
}

float compress(float V) {
    float a = uCompressA;
    return sign(V) * log(1.0 + a * abs(V)) / log(1.0 + a * uVmax);
}

vec3 paletteDiverging(float x) {
    // x в [-1,1]
    float t = 0.5 + 0.5 * x;
    // простая синяя→красная
    vec3 blue = vec3(0.1,0.2,0.9);
    vec3 red  = vec3(0.9,0.2,0.1);
    return mix(blue, red, t);
}

float isoMask(float Vc) {
    // периодический метод
    float scaled = (Vc + 1.0) / 2.0 / uIsoStep; // нормализация
    float f = abs(fract(scaled) - 0.5);
    float m = step(f, uIsoWidth);
    return m;
}

void main() {
    vec2 p = coordFromUV(vUV);
    float V  = potential(p);
    float Vc = compress(V);
    Vc = clamp(Vc, -1.0, 1.0);

    vec3 base = paletteDiverging(Vc);

    if (uShowIso) {
        float m = isoMask(Vc);
        base = mix(base, vec3(1.0), m);
    }

    gl_FragColor = vec4(base, 1.0);
}
```

## Потенциальные улучшения
- 1D-текстура палитры.
- Смешивание нескольких палитр.
- MSAA или FXAA для сглаживания линий.
- Использование derivative (fwidth) для тонких эквипотенциальных линий:
```
float g = abs(fract(scaled)-0.5)/fwidth(scaled);
float alpha = 1.0 - smoothstep(0.0, 1.0, g);
```

## Переход к WebGPU
- Storage buffer для зарядов (структуры {vec2 pos; float q;}).
- Compute pass для предвычисления поля в текстуру (R32Float).
- Второй рендер-проход для окраски + оверлеи.

---
