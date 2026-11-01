<?php

namespace App\Services\Mapping\Exceptions;

use Exception;

class TransformationException extends Exception
{
    public function __construct(
        string $message,
        public readonly string $field = '',
        public readonly mixed $invalidValue = null,
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
