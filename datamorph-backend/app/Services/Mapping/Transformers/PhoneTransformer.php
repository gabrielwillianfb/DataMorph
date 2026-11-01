<?php

namespace App\Services\Mapping\Transformers;

class PhoneTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $digits = preg_replace('/\D/', '', (string)$value);

        if (strlen($digits) === 11) {
            return sprintf('(%s) %s-%s', substr($digits, 0, 2), substr($digits, 2, 5), substr($digits, 7));
        }

        if (strlen($digits) === 10) {
            return sprintf('(%s) %s-%s', substr($digits, 0, 2), substr($digits, 2, 4), substr($digits, 6));
        }

        return $value;
    }
}
