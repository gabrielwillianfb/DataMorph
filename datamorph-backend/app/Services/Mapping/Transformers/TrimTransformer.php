<?php

namespace App\Services\Mapping\Transformers;

class TrimTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        // Remove espaços normais, quebras de linha e non-breaking spaces (\xc2\xa0)
        return trim(preg_replace('/^[\pZ\pC]+|[\pZ\pC]+$/u', '', $value) ?? '');
    }
}
